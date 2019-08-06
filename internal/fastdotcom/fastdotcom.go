package main

import (
	"fmt"
	"log"
	"net/http"

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
	return FastDotCom{}, nil
}

// GetHTML returns the Html representation of fast.com
func (fdcm FastDotCom) GetHTML() (FastDotCom, error) {
	resp, err := http.Get("https://fast.com")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("Response status:", resp.Status)
	fastCom := FastDotCom{}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		panic(err)
	}

	doc.Find("script").Each(func(idx int, script *goquery.Selection) {
		println(idx)
		node, ok := script.Attr("src")
		if !ok {
			log.Fatalln("Src tag missing...")
		}
		println(node)
	})
	// body, err := ioutil.ReadAll(resp.Body)
	// stringBody := string(body)

	// if num := strings.Count(stringBody, "script src"); num > 0 {
	// 	println((num))
	// }
	// fmt.Println(stringBody)
	return fastCom, nil
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func main() {
	fastCom := FastDotCom{}
	res, err := fastCom.GetHTML()
	if err != nil {
		panic(err)
	}

	fmt.Println(res)
}
