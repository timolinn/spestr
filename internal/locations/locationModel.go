package locations

import (
	"context"
	"fmt"
	"time"

	"github.com/kr/pretty"
	"github.com/timolinn/spestr/internal/config"
	"github.com/timolinn/spestr/internal/util"

	"googlemaps.github.io/maps"
)

type Coordinates struct {
	Coords struct {
		Accuracy  int     `json:"accuracy"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	} `json:"coords"`
	Timestamp int `json:"timestamp"`
}

// Location model
type Location struct {
	Lat              string
	Lon              string
	City             string
	LGA              string // administerativelevel_2
	State            string // administerativelevel_1
	Country          string
	PlaceID          string
	Neighborhood     string
	FormattedAddress string
	ID               uint       `gorm:"primary_key"`
	CreatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP"`
	DeletedAt        *time.Time `sql:"index"`
}

// TableName returns the model's
// database table name
func (l Location) TableName() string {
	return "locations"
}

// Prepare populates Location data from google maps
// API
func (l *Location) Prepare(coord Coordinates) error {
	c, err := maps.NewClient(maps.WithAPIKey(config.New().GoogleAPIKey()))
	if err != nil {
		return err
	}

	r := &maps.LatLng{
		Lat: coord.Coords.Latitude,  //6.4474,6.6147419,3.3742382
		Lng: coord.Coords.Longitude, //3.3903,
	}

	geocoder := &maps.GeocodingRequest{
		LatLng: r,
	}

	loc, err := c.Geocode(context.Background(), geocoder)
	if err != nil {
		return err
	}

	addr := loc[0].AddressComponents
	pretty.Println(addr)
	l.City = get(addr, "locality")
	l.Country = get(addr, "country")
	l.LGA = get(addr, "administrative_area_level_2")
	l.State = get(addr, "administrative_area_level_1")
	l.Neighborhood = get(addr, "neighborhood")
	l.FormattedAddress = loc[0].FormattedAddress
	l.PlaceID = loc[0].PlaceID
	l.Lat = fmt.Sprintf("%f", coord.Coords.Latitude)
	l.Lon = fmt.Sprintf("%f", coord.Coords.Longitude)
	// pretty.Println(l)
	return nil
}

func get(list []maps.AddressComponent, key string) string {
	for _, comp := range list {
		if util.Contains(comp.Types, key) {
			return comp.LongName
		}
	}
	return ""
}
