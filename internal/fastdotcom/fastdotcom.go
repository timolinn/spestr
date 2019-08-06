package main

import (
	"fmt"
	"log"

	"github.com/PuerkitoBio/goquery"
)

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

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
	Client  string
	Servers string
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest() (FastDotCom, error) {
	// get the html page and parse it
	html := getHTML("https://fast.com")

	// get the javascript file
	// only one js file: /app-8f1bee.js at the time of writing
	jsFileName, ok := html.Find("script").Attr("src")
	if !ok {
		log.Fatalln("Src tag missing...")
	}
	println(jsFileName)

	jsURL := "https://fast.com" + jsFileName
	fmt.Println("Javascript url " + jsURL)

	return FastDotCom{}, nil
}

func getHTML(url string) *goquery.Document {
	doc, err := goquery.NewDocument(url)
	if err != nil {
		panic(err)
	}
	return doc
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func main() {
	fastCom := FastDotCom{}
	res, err := fastCom.RunSpeedTest()
	if err != nil {
		panic(err)
	}

	fmt.Println(res)
}
