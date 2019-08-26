package util

import (
	"encoding/json"
	"io/ioutil"
	"net"
	"net/http"
	"os"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func CheckError(err error, context string) {
	if err != nil {
		log.Fatalln(errors.Wrap(err, context))
	}
}

type IPData struct {
	Isp         string `json:"isp"`
	City        string `json:"city"`
	Country     string `json:"country"`
	Org         string `json:"org"`
	Region      string `json:"region"`
	RegionName  string `json:"regionName"`
	Status      string `json:"status"`
	Timezome    string `json:"timezone"`
	As          string `json:"as"`
	CountryCode string `json:"countrycode"`
	Lat         int    `json:"lat"`
	Lon         int    `json:"lon"`
}

func FetchISPInfo() (IPData, error) {
	result, err := http.Get("http://ip-api.com/json")
	CheckError(err, "Failed to fetch data")
	defer result.Body.Close()

	r, err := ioutil.ReadAll(result.Body)
	CheckError(err, "Failed to read stream")

	s := new(IPData)
	json.Unmarshal(r, &s)

	return *s, nil
}

func GetIPAddr() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Fatalln(errors.Wrap(err, "error fetching interface"))
	}

	for _, a := range addrs {
		if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				// fmt.Println(ipnet.IP.String())
				return ipnet.IP.String(), nil
			}
		}
	}

	return "", errors.New("IP not found")
}

// Returns true if file exists
func Exists(filename string) bool {
	info, err := os.Stat(filename)

	return err == nil && !info.IsDir()
}
