package locations

import (
	"time"
)

// Location model
type Location struct {
	Lat              string
	Lon              string
	City             string
	LGA              string // administerativelevel_2
	State            string // administerativelevel_1
	Country          string
	PlaceID          string
	FormattedAddress string
	ID               uint `gorm:"primary_key"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        *time.Time `sql:"index"`
}

// TableName returns the model's
// database table name
func (l Location) TableName() string {
	return "locations"
}
