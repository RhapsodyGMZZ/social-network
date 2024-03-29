"use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { CADDY_URL } from "@/app/lib/constants";

/**
 * Schema for the registration form data.
 *
 * @remarks
 * This schema defines the validation rules for the registration form fields.
 * It includes validation for email, password, confirmation, first name, last name,
 * date of birth, nickname, about, and avatar.
 *
 * @type {import("zod").ZodObject<...>}
 */
const registerFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmation: z.string().min(6),
  firstName: z.string().refine((value) => value.trim() !== "", {
    message: "First name is required",
  }),
  lastName: z.string().refine((value) => value.trim() !== "", {
    message: "Last name is required",
  }),
  dateOfBirth: z.string().refine((value) => value.trim() !== "", {
    message: "Date of birth is required",
  }),
  status: z.enum(['public', 'private'], {
    invalid_type_error: "Please select a profile status"
  }),
  nickname: z.string().optional(),
  about: z.string().optional(),
  //REMIND 10Mb max
  avatar: z.custom((v) => v instanceof File && v.size < 100000, {
    message: "Invalid file or file size too large",
  }).optional(),
}).refine((data) => data.password === data.confirmation, {
  message: "Passwords do not match",
  path: ["confirmation"],
})

/**
 * Represents the state object for the registration actions.
 */
export type State = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmation?: string[];
    firstName?: string[];
    lastName?: string[];
    dateOfBirth?: string[];
    status?: string[];
    nickname?: string[];
    about?: string[];
    avatar?: string[];
  };
  message?: string | null;
};

/**
 * Registers a user with the provided form data.
 * 
 * @param prevState - The previous state of the application.
 * @param formData - The form data containing user information.
 * @returns The state object with errors and a message if the form is invalid, or undefined if the registration is successful.
 */
export async function register(
  prevState: State | undefined,
  formData: FormData,
) {
  const validatedData = registerFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    status: formData.get("status"),
    nickname: formData.get("nickname"),
    about: formData.get("about"),
    avatar: formData.get("avatar"),
  });

  if (!validatedData.success) {
    const state: State = {
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid form",
    };
    return state;
  }

  const uuid = uuidv4();

  if ((validatedData.data.avatar as File).size > 0) {
    const f = new FormData();
    f.append("uuid", uuid);
    f.append("avatar", validatedData.data.avatar as Blob);
    try {
      const upload = await axios.post(
        `${CADDY_URL}/avatar`,
        f,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    } catch (error) {
      const state: State = {
        errors: { avatar: ["Failed to upload avatar"] },
        message: "Failed to upload avatar",
      };
      return state;
    }
  }

  const userData = {
    uuid: uuid,
    email: validatedData.data.email,
    password: validatedData.data.password,
    firstName: validatedData.data.firstName,
    lastName: validatedData.data.lastName,
    dateOfBirth: validatedData.data.dateOfBirth,
    status: validatedData.data.status,
    nickname: validatedData.data.nickname,
    about: validatedData.data.about,
  };

  try {
    const res = await axios.post(
      `${CADDY_URL}/register`,
      userData,
    );
    revalidatePath("/login");
    redirect("/login");
  } catch (error) {
    if ((error as AxiosError).response && (error as AxiosError).response?.status === 409) {
      const state: State = {
        errors: { email: ["Email already exists"] },
        message: "Email already exists",
      };
      return state;
    }
    throw error;
  }
}
