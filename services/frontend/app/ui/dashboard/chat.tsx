"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { CADDY_URL, emojis } from "@/app/lib/constants";
import toast from "react-hot-toast";
import { EnvelopeIcon, XMarkIcon, FaceSmileIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import Link from "next/link";
import { Follower } from "@/app/lib/definitions";

class Message {
  msg_type: string;
  content: string;
  target: string;
  type_target: string;
  sender: string;
  sender_name: string;
  date: string;
  image: string;

  constructor(
    msg_type: string,
    content: string,
    target: string,
    type_target: string,
    sender: string,
    image: string,
    sender_name?: string,
  ) {
    this.msg_type = msg_type;
    this.content = content;
    this.type_target = type_target;
    this.target = target;
    this.sender = sender;
    sender_name != undefined ? this.sender_name = sender_name : this.sender_name = "";
    // let date = new Date()
    this.date = "";//`${date.toLocaleDateString("fr")}-${date.toLocaleTimeString("fr")}`;
    this.image = image;
  }
}
class Target {
  type_target?: string;
  target?: string;
  constructor(
    type_target?: string,
    target?: string,
  ) {
    this.type_target = type_target;
    this.target = target;
  }
}
class ConnBtn {
  username: string;
  uuid: string;
  online: boolean;
  constructor(username: string, uuid: string, online: boolean) {
    this.username = username;
    this.uuid = uuid;
    this.online = online;
  }
}
class ListUser {
  tab: Array<ConnBtn>;
  constructor() {
    this.tab = new Array();
  }
  new(username: string, uuid: string, online: boolean) {
    this.tab.push(new ConnBtn(username, uuid, online));
  }
}
class ListMessage {
  tab: Array<Message>;
  constructor() {
    this.tab = new Array();
  }
  add(message: Message) {
    this.tab.push(message);
  }
  new(
    msg_type: string,
    content: string,
    target: string,
    type_target: string,
    sender: string,
    image: string,
  ) {
    this.tab.push(
      new Message(
        msg_type,
        content,
        target,
        type_target,
        sender,
        image,
      ),
    );
  }
}
class Groupe {
  name: string;
  id: string;
  constructor
    (
      name: string,
      id: string,) {
    this.name = name;
    this.id = id;
  }
}
export default function Chat({ user, followers, followed, followerUUIDS }: { user: string | null, followers: Follower[], followed: Follower[], followerUUIDS: string[] }) {
  let listUser = new ListUser();
  const userUuid = user;
  const [content, setContent] = useState<string>("");
  const [socket, setsocket] = useState(Object);
  const [userList, setUserList] = useState(listUser.tab);
  const [groupList, setGroupList] = useState(Array<Groupe>);
  const [messageList, setmessageList] = useState(new ListMessage().tab);
  const [target, setTarget] = useState(new Target());
  const [typing, setTyping] = useState(false);
  const [emoji, setEmoji] = useState(false)
  const [writer, setWriter] = useState("")
  const [toSend, setToSend] = useState("")


  useEffect(() => {
    let sc = new WebSocket("ws://45.147.98.213:8000/api/ws");
    // let sc = new WebSocket("ws://localhost:8000/api/ws");
    sc.onopen = (event) => {
      console.log("WebSocket connection opened");
      sc.send(userUuid ?? "");
    };

    followers?.forEach((elem: Follower) => followerUUIDS.push(elem.uuid))
    const users = followed?.filter((val: Follower) => followerUUIDS.includes(val.uuid));
    let usersInCommon: string[];
    usersInCommon = []
    users?.forEach((u: Follower) => usersInCommon.push(u.uuid))

    sc.onmessage = (event) => {
      let message: any;
      try {
        message = JSON.parse(event.data);
      } catch {
        console.error("WebSocket message error:", event.data);
      }

      switch (message?.msg_type) {
        case "status":
          listUser = new ListUser();
          message.status
            .filter((elem: ConnBtn) => {
              return usersInCommon.includes(elem.uuid)
            })
            .forEach((el: ConnBtn) => {
              listUser.new(el.username, el.uuid, el.online);
            });
          setUserList(listUser.tab);

          let tabGroupe = new Array<Groupe>
          message.groupe
            .forEach((elgroupe: Groupe) => {
              tabGroupe.push(elgroupe);
            })
          setGroupList(tabGroupe)
          break;
        case "chat":
          if (message.target === user || message.type_target === "group") {
            toast((t) => (
              <div
                className="hover:cursor-pointer w-full h-auto p-2 flex flex-row justify-around items-center"
                id={message.sender_name}
                onClick={() => {
                  (message.type_target === "user" ? setTarget(new Target("user", message.sender)) : setTarget(new Target("group", message.groupe.id)))
                    ;
                  sc.send(JSON.stringify(
                    new Message(
                      "history",
                      "",
                      message.sender,
                      "user",
                      userUuid ?? "",
                      "",
                    ),
                  ));
                  toast.dismiss(t.id)
                }}
              >
                <Image
                  src={`${CADDY_URL}/avatar?id=${message.sender}`}
                  alt="Profile Picture"
                  width={50}
                  height={50}
                  className="rounded-full shadow-xl mr-5 border-4 border-purple-400"
                />
                <div className="text-center">
                  <span className="text-purple-700 font-medium">
                    {message.sender_name}&nbsp;
                  </span>
                  
                  <span>sent {message.type_target === "user" ? "you" : ""} a message {message.type_target === "group" ? `to group chat` : ""}  !</span>

                </div>
              </div>
            ), {
              icon: <EnvelopeIcon className="w-9 m-2" />, position: "top-right", style: {
                display: "flex",
                flexDirection: "row-reverse",
                boxShadow: "0 2px 6px rgba(0,0,0,.5)"
              }, duration: 3000
            });
          }
          break
      }
    };

    sc.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    sc.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };
    setsocket(sc);
    return () => {
      sc.close();
    };
  }, []);


  let timeout: NodeJS.Timeout;
  useEffect(() => {
    socket.onmessage = (event: { data: string }) => {
      let message: any;
      try {
        message = JSON.parse(event.data);
      } catch {
        console.error("WebSocket message error:", event.data);
      }

      switch (message.msg_type) {
        case "status":
          listUser = new ListUser();
          message.status
            .filter((el: ConnBtn) => {
              return el.uuid != userUuid;
            })
            .forEach((el: ConnBtn) => {
              listUser.new(el.username, el.uuid, el.online);
            });
          setUserList(listUser.tab);
          let tabGroupe = new Array<Groupe>
          message.groupe
            .forEach((elgroupe: Groupe) => {
              tabGroupe.push(elgroupe);
            })
          setGroupList(tabGroupe)
          break;
        case "history":
          let listMessage = new ListMessage();
          message.tab_message.forEach((el: Message) => {
            listMessage.add(el);
          })
          setmessageList(listMessage.tab);
          break;
        case "chat":

          if ((message.target == target.target || message.sender == target.target) && target.type_target === message.type_target) {
            setmessageList(prevMessage => [...prevMessage,
            new Message(
              message.msg_type,
              message.content,
              message.target,
              message.type_target,
              message.sender,
              message.image,
              message.sender_name,
            )
            ]);
          } else {
            toast((t) => (
              <div
                className="hover:cursor-pointer w-full h-auto p-2 flex flex-row justify-around items-center"
                id={message.sender_name}
                onClick={() => {
                  setTarget(new Target("user", message.sender));
                  socket.send(JSON.stringify(
                    new Message(
                      "history",
                      "",
                      message.sender,
                      "user",
                      userUuid ?? "",
                      "",
                    ),
                  ));
                  toast.dismiss(t.id)
                }}
              >
                <Image
                  src={`${CADDY_URL}/avatar?id=${message.sender}`}
                  alt="Profile Picture"
                  width={50}
                  height={50}
                  className="rounded-full shadow-xl mr-5 border-4 border-purple-400"
                />
                <div className="text-center">
                  <span className="text-purple-700 font-medium">
                    {message.sender_name}&nbsp;
                  </span>
                  <span>sent {message.type_target === "user" ? "you" : ""} a message {message.type_target === "group" ? `to group chat` : ""}  !</span>
                </div>
              </div>
            ), {
              icon: <EnvelopeIcon className="w-9 m-2" />, position: "top-right", style: {
                display: "flex",
                flexDirection: "row-reverse",
                boxShadow: "0 2px 6px rgba(0,0,0,.5)"
              }, duration: 3000
            });
          }
          break;
        case "typing":
          if (message.target == target.target || message.sender == target.target) {
            setTyping(true);
            setWriter(message.sender_name);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
              setTyping(false)
            }, 1000);
          }
          break;
      }
    };
  }, [target]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollToBottom()
  }, [messageList]);
  return (

    <div className="chat flex flex-col px-3 py-4 md:px-2 text-purple-700">
      <h1 className="font-bold">Chat</h1>
      <div className="chanel-list flex-row mb-2 h-50 items-end justify-center rounded-md bg-white p-4 md:h-50">
        <h2 className="font-bold">Users</h2>
        <div className="user">
          {userList.map((users, idx) => {
            return (
              <div key={"user" + idx} className="items-end justify-center rounded-md bg-white border border-purple-400 shadow-lg my-5 hover:text-purple-500 hover:font-bold p-3 md:h-50 mb-1">
                <button
                className="flex flex-row items-center"
                  id={users.username}
                  onClick={(e) => {
                    setTarget(new Target("user", users.uuid));
                    setToSend(users.username)
                    socket.send(JSON.stringify(
                      new Message(
                        "history",
                        "",
                        users.uuid,
                        "user",
                        userUuid ?? "",
                        "",
                      ),
                    ));
                  }}
                >
                  <svg className="notification mr-2" width="10" height="10">
                    <circle
                      cx="5"
                      cy="5"
                      r="5"
                      fill={users.online ? "green" : "red"}
                      >
                    </circle>
                  </svg>
                      {users.username}
                </button>
              </div>
            );
          })}
        </div>
        <div className="group">
          <h2 className="font-bold">Groupe</h2>
          {groupList?.map((group, idx) => {
            return (
              <div key={"groupe" + idx} className="items-end justify-center rounded-md bg-white border border-purple-400 hover:text-purple-500 hover:font-bold shadow-lg my-5 p-3 md:h-50  mb-1 ">
                <button
                  id={group.name}
                  onClick={(e) => {
                    let t = new Target("group", group.id);
                    setTarget(t);
                    setToSend(group.name)
                    socket.send(JSON.stringify(
                      new Message(
                        "history",
                        "",
                        group.id,
                        "group",
                        userUuid ?? "",
                        "",
                      ),
                    ));
                  }}>{group.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {/* REMIND BOX CHAT HERE*/}
      {target.target !== undefined ? (
        <div className="chat-container flex flex-col shadow-xl mb-2 h-[560px] w-[360px] justify-between rounded-md bg-white p-4 md:h-50 fixed bottom-0 right-9 z-50">
          <div className="flex flex-row justify-between w-full">
            <Link
              onClick={() => setTarget(new Target())}
              href={{
                pathname: target.target.length !== 36 ? "/dashboard/groups/group":"/dashboard/profile",
                query: {user : encodeURIComponent(target.target),id : encodeURIComponent(target.target)},
              }}
            >
              <div className="flex flex-row w-auto h-auto items-center">
                <Image
                  src={`${CADDY_URL}/avatar?id=${target.target}`}
                  alt="Profile Picture"
                  width={50}
                  height={50}
                  className="rounded-full shadow-xl"
                />
                <p className="text-purple-700 font-bold ml-5">
                  {toSend}
                </p>
              </div>
            </Link>
            <div className="flex w-1/6 h-[30px] justify-end self-end z-50">
              <XMarkIcon className={"self-end w-9 hover:cursor-pointer mb-3"} onClick={() => setTarget(new Target())} />
            </div>
          </div>
          <div className="messages overflow-y-scroll h-[400px] grid grid-cols-1 ">
            {messageList.map((message, idx) => {

              return (
                <div key={idx} className={`shadow-lg h-fit break-words w-3/4 rounded-lg p-4 mb-3 border-purple-300 border ${message.sender === userUuid ?
                  "justify-self-end text-right bg-purple-100" : "text-left "}`}>
                  <p className="font-bold">{message.sender_name}</p>

                  <div>{message.content}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="sender bg-purple-200 flex flex-col p-4 mb-2 h-25 rounded-lg">
            <div className={typing ? "" : "hidden"}>
              <div className="w-full flex flex-row items-baseline justify-start mb-1">
                <p><span className="font-bold">{writer}</span> is typing</p>
                <BeatLoader size={5} className="ml-1" />
              </div>

            </div>
            <form id="form-chat">
              <div className="flex flex-row items-center justify-between">
                <FaceSmileIcon className="w-7" onClick={() => { setEmoji(emoji ? false : true) }} />
                <textarea
                  className="shadow-xl w-3/4 rounded-lg resize-none h-7 focus:px-3"
                  id="chat-text"
                  value={content}
                  onChange={(e) => {
                    socket.send(JSON.stringify(new Message(
                      "typing",
                      content,
                      target?.target ?? "",
                      target?.type_target ?? "",
                      userUuid ?? "",
                      "",
                    )))
                    setContent(e.target.value);
                  }}
                >
                </textarea>
                <PaperAirplaneIcon
                  className={"w-7 ml-2"}
                  id="submit"
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (target.target !== "undefined" && content !== "") {
                      let message = new Message(
                        "chat",
                        content,
                        target?.target ?? "",
                        target?.type_target ?? "",
                        userUuid ?? "",
                        "",
                      );
                      let msg = JSON.stringify(message);
                      setContent("");
                      socket.send(msg);
                    } else {
                      toast.error('WARNING your message is empty')
                    }
                  }}
                >Send
                </PaperAirplaneIcon>
              </div>
            </form>
            {emoji ?
              <div className="flex flex-wrap max-w-[300px] max-h-[60px] overflow-y-auto border p-2 border-purple-700 rounded-lg mt-3">
                {
                  emojis.map((emoji: string, idx: number) => {
                    return (
                      <button key={idx} onClick={() => setContent(content + emoji)}>{emoji}</button>
                    )
                  })
                }
              </div> : ""}
          </div>
        </div>
      ) : ""}
    </div>
  );
}
