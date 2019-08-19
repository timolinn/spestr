package home

import (
	"time"

	"github.com/timolinn/spestr/internal/isp"
	"github.com/timolinn/spestr/internal/locations"
)

type NetworkModel struct {
	ID            uint `gorm:"primary_key"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time `sql:"index"`
	DownloadSpeed int        `gorm:"not null"`
	UploadSpeed   int
	Latency       int
	Location      locations.Location
	IspModel      isp.IspModel
}

func (n NetworkModel) TableName() string {
	return "networks"
}
