package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
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
	for _, server := range servers {
		fmt.Println(server.URL)
		go func(url string, data chan []byte, databytes []byte) {
			getHTML(url, data, databytes)
		}(server.URL, dataChannel, []byte(server.URL))
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

func getHTML(url string, dataChannel chan []byte, bytess []byte) {
	bytes, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer bytes.Body.Close()
	// expecting upto 25mb of data
	// this should be chunked or bufferred
	// body, _ := ioutil.ReadAll(bytes.Body)

	fmt.Println("passing data for " + url + " through the channel")
	dataChannel <- bytess
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func main() {
	fastCom := FastDotCom{}
	dataChannel := make(chan []byte)
	_, err := fastCom.RunSpeedTest(dataChannel)
	if err != nil {
		panic(err)
	}

	fmt.Println(<-dataChannel)
	// close(dataChannel)
	fmt.Scanln()
}
