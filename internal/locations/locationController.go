package locations

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kr/pretty"
	"googlemaps.github.io/maps"
)

func GetLocation(router *gin.Engine) {
	router.GET("/location", func(c *gin.Context) {
		coords, _ := getCoordinates()
		c.String(http.StatusOK, coords)
	})
}

func getCoordinates() (string, error) {

	c, err := maps.NewClient(maps.WithAPIKey("api-key"))
	if err != nil {
		panic(err)
	}

	r := &maps.LatLng{
		Lat: 6.43055,
		Lng: 3.41336,
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
