package isp

import "time"

type IspModel struct {
	Name           string `gorm:"index:name"`
	ConnectionType string // 2g/3g/4g
	ServerLocation string
	RegionName     string
	RegionCode     string
	Timezone       string
	Query          string
	City           string
	Country        string
	CountryCode    string
	ID             uint `gorm:"primary_key"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      *time.Time `sql:"index"`
}

// TableName returns the model's
// database table name
func (l IspModel) TableName() string {
	return "isps"
}
