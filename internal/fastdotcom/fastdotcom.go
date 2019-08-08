package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
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
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan []byte, serverChannel chan []Server) (FastDotCom, error) {
	go getServers(serverChannel)
	idx := 0
	for servers := <-serverChannel; idx < len(servers); idx++ {
		go func(url string, databytes []byte) {
			// html := getHTML(url, databytes)
			dataChannel <- getHTML(url, databytes)
		}(servers[idx].URL, []byte(servers[idx].URL))
	}

	return FastDotCom{}, nil
}

func getServers(serverChannel chan []Server) ([]Server, error) {
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
	serverChannel <- srs
	fmt.Println("Closing server channel")
	close(serverChannel)
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

	return body
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func main() {
	start := time.Now()
	fastCom := FastDotCom{}
	dataChannel := make(chan []byte)
	serverChannel := make(chan []Server)
	_, err := fastCom.RunSpeedTest(dataChannel, serverChannel)
	if err != nil {
		panic(err)
	}
	numComplete := 0
	for data := range dataChannel {
		numComplete++
		fmt.Println(len(data))
		if numComplete > 2 {
			close(dataChannel)
		}
	}
	fmt.Println("Done")
	fmt.Println(time.Since(start))
}
