package locations

import (
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/timolinn/spestr/internal"
	"github.com/timolinn/spestr/internal/config"
	"googlemaps.github.io/maps"
)

func TestPrepare(t *testing.T) {
	l := new(Location)
	coord := Coordinates{}
	coord.Coords.Latitude = 6.5537876
	coord.Coords.Accuracy = 20
	coord.Coords.Longitude = 3.3659937

	httpClient, teardown := internal.TestingHTTPClient(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := `{
			"results" : [
				{
					"address_components": [
						{
							"long_name":  "235",
							"short_name": "235",
							"types":     ["street_number"]
						},
						{
							"long_name":  "Ikorodu Road",
							"short_name": "Ikorodu Rd",
							"types":     ["route"]
						},
						{
							"long_name":  "Ilupeju",
							"short_name": "Ilupeju",
							"types":     ["neighborhood", "political"]
						},
						{
							"long_name":  "Lagos",
							"short_name": "Lagos",
							"types":     ["locality", "political"]
						},
						{
							"long_name":  "Mushin",
							"short_name": "Mushin",
							"types":     ["administrative_area_level_2", "political"]
						},
						{
							"long_name":  "Lagos",
							"short_name": "LA",
							"types":     ["administrative_area_level_1", "political"]
						},
						{
							"long_name":  "Nigeria",
							"short_name": "NG",
							"types":     ["country", "political"]
						}
					],
					"formatted_address": "235 Ikorodu Rd, Ilupeju, Lagos, Nigeria",
					"geometry": {
						"location":     {
							"lat": 6.5537876,
							"lng": 3.3659937
						},
						"location_type": "ROOFTOP",
						"bounds": {
							"northeast": {
								"lat": 6.553883,
								"lng": 3.3665983
							},
							"southwest": {
								"lat": 6.5537396,
								"lng": 3.365838
							}
						},
						"viewport": {
							"northeast": {
								"lat": 6.555160280291503,
								"lng": 3.367567130291501
							},
							"southwest": {
								"lat": 6.552462319708498,
								"lng": 3.364869169708498
							}
						},
						"types": []
					},
					"types":        ["premise"],
					"place_id":      "ChIJwVcEqJGNOxARd4AMLexbFqo",
					"partial_match": false,
					"plus_code":     {}
				}
					],
					"status": "OK"
				}`
		w.WriteHeader(200)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		// w.Write([]byte(response))
		fmt.Fprintln(w, response)
	}))
	defer teardown()
	c, err := maps.NewClient(maps.WithAPIKey(config.New().GoogleAPIKey()), maps.WithHTTPClient(httpClient))

	if err != nil {
		t.Error(err)
		return
	}
	err = l.Prepare(coord, c)
	t.Log(err)

	t.Run("#Location.Prepare - assert location  details", func(t *testing.T) {
		assert.Equal(t, "Lagos", l.City, "City does not match")
		assert.Equal(t, "235 Ikorodu Rd, Ilupeju, Lagos, Nigeria", l.FormattedAddress, "FormattedAddress does not match")
		assert.Equal(t, "Mushin", l.LGA, "LGA does not match")
		assert.Equal(t, "Lagos", l.State, "State does not match")
		assert.Equal(t, "Ilupeju", l.Neighborhood, "Neighborhood does not match")
		assert.Equal(t, "ChIJwVcEqJGNOxARd4AMLexbFqo", l.PlaceID, "PlaceID does not match")
		assert.Equal(t, "6.5537876", l.Lat, "Lat does not match")
		assert.Equal(t, "3.3659937", l.Lon, "Lon does not match")
	})
}

func init() {
	os.Setenv("APP_ENV", "test")
}
