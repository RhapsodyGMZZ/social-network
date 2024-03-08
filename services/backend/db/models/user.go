package models

type User struct {
	UUID        string `json:"uuid"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	Nickname    string `json:"nickname"`
	About       string `json:"about"`
}
