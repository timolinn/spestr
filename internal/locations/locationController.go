package locations

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kr/pretty"
	"github.com/timolinn/spestr/internal/config"
	"googlemaps.github.io/maps"
)

func GetLocation(router *gin.Engine, cfg *config.Configuration) {
	router.GET("/location", func(c *gin.Context) {
		coords, _ := getCoordinates(cfg.GoogleAPIKey())
		c.String(http.StatusOK, coords)
	})
}

func getCoordinates(apiKey string) (string, error) {
	c, err := maps.NewClient(maps.WithAPIKey(apiKey))
	if err != nil {
		panic(err)
	}

	r := &maps.LatLng{
		Lat: 6.4474,
		Lng: 3.3903,
	}
	// r := &maps.PlaceDetailsRequest{
	// 	Fields: []maps.PlaceDetailsFieldMask{
	// 		"address_component",
	// 		"adr_address",
	// 		"geometry",
	// 		"name",
	// 		"place_id",
	// 	},
	// }

	geocoder := &maps.GeocodingRequest{
		LatLng: r,
	}

	loc, err := c.Geocode(context.Background(), geocoder)
	if err != nil {
		panic(err)
	}

	pretty.Println(loc[0])
	return "3.5595,6.900", nil
}
