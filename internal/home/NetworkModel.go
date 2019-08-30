package home

import (
	"fmt"
	"strconv"
	"time"

	"github.com/timolinn/spestr/internal/platforms/postgres"

	"github.com/timolinn/spestr/internal/util"

	"github.com/timolinn/spestr/internal/fastdotcom"

	"github.com/timolinn/spestr/internal/isp"
	"github.com/timolinn/spestr/internal/locations"
)

type NetworkModel struct {
	ID              uint       `gorm:"primary_key"`
	CreatedAt       time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt       time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt       *time.Time `sql:"index"`
	DownloadSpeed   int        `gorm:"not null"`
	UploadSpeed     int
	LatencyLoaded   int
	LatencyUnloaded int
	Location        locations.Location
	IspModel        isp.IspModel
}

func (n NetworkModel) TableName() string {
	return "networks"
}

// SaveNetworkData saves the speed test result and metadata to database
func SaveNetworkData(fst fastdotcom.FastDotCom, ipdata util.IPData, coords locations.Coordinates, connType string) {
	ispm := isp.IspModel{
		Name:           ipdata.Isp,
		City:           ipdata.City,
		Timezone:       ipdata.Timezome,
		Country:        ipdata.Country,
		CountryCode:    ipdata.CountryCode,
		RegionName:     ipdata.RegionName,
		RegionCode:     ipdata.Region,
		ServerLocation: strconv.Itoa(ipdata.Lat) + "," + strconv.Itoa(ipdata.Lon),
		ConnectionType: connType,
	}

	postgres.DB.FirstOrCreate(&ispm, isp.IspModel{Name: ipdata.Isp})

	loc := new(locations.Location)
	loc.Prepare(coords)
	postgres.DB.Create(&loc)

	nm := NetworkModel{
		DownloadSpeed:   fst.Network.Download,
		UploadSpeed:     fst.Network.Upload,
		LatencyLoaded:   fst.Network.Latency.Loaded,
		LatencyUnloaded: fst.Network.Latency.Unloaded,
		IspModel:        ispm,
		Location:        *loc,
	}

	postgres.DB.Create(&nm)
	fmt.Println(ispm, nm)

}
