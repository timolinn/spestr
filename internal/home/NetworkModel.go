package home

import (
	"fmt"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"
	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/platforms/postgres"
	"googlemaps.github.io/maps"

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

	loc := new(locations.Location)

	c, err := maps.NewClient(maps.WithAPIKey(config.New().GoogleAPIKey()))
	if err != nil {
		log.Error("Error initializing google map client")
	}

	loc.Prepare(coords, c)

	nm := NetworkModel{
		DownloadSpeed:   fst.Network.Download,
		UploadSpeed:     fst.Network.Upload,
		LatencyLoaded:   fst.Network.Latency.Loaded,
		LatencyUnloaded: fst.Network.Latency.Unloaded,
		IspModel:        ispm,
		Location:        *loc,
	}

	postgres.DB.FirstOrCreate(&ispm, isp.IspModel{Name: ipdata.Isp, ConnectionType: connType})
	postgres.DB.Create(&loc)
	postgres.DB.Create(&nm)
	fmt.Println(ispm, nm)
}
