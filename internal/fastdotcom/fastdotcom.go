package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"runtime"
	"time"
)

const baseURL = "https://api.fast.com/"

// NetworkStatus represents the summary
// of the tested network
type NetworkStatus struct {
	Upload   string
	Download string
	Latency  struct {
		Loaded   string
		Unloaded string
	}
}

type Server struct {
	URL string `json:"url"`
}

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
	Servers []Server
	Client  string
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan []byte) (FastDotCom, error) {
	servers, _ := getServers()
	numComplete := 0
	for _, server := range servers {
		numComplete++
		go func(url string, databytes []byte) {
			html := getHTML(url, databytes)
			fmt.Println(len(html))
			numComplete--
		}(server.URL, []byte(server.URL))
	}

	for numComplete > 0 {
		time.Sleep(1 * time.Millisecond)
	}
	return FastDotCom{}, nil
}

func getServers() ([]Server, error) {
	// fast.com token. This was gotten from the jsFile on fast.com
	// /app-8f1bee.js at the time of writing
	token := "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm"
	url := baseURL + "netflix/speedtest?https=true&token=" + token + "&urlCount=3"

	urls, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer urls.Body.Close()

	body, err := ioutil.ReadAll(urls.Body)
	if err != nil {
		return nil, err
	}

	var srs []Server
	json.Unmarshal(body, &srs)
	return srs, nil
}

func getHTML(url string, bytess []byte) []byte {
	bytes, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer bytes.Body.Close()
	// expecting upto 25mb of data
	// this should be chunked or bufferred
	body, _ := ioutil.ReadAll(bytes.Body)

	// fmt.Println("passing data for " + url + " through the channel")
	return body
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func main() {
	start := time.Now()
	runtime.GOMAXPROCS(3)
	fastCom := FastDotCom{}
	dataChannel := make(chan []byte)
	_, err := fastCom.RunSpeedTest(dataChannel)
	if err != nil {
		panic(err)
	}

	fmt.Println(time.Since(start))
}
