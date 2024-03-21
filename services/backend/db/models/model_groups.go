package models

import "time"

type Groups struct {
	ID           int       `json:"id"`
	CreationDate time.Time `json:"creation_date"`
	CreatorID    int       `json:"creator_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
}
