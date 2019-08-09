package main

import (
	"fmt"
	"log"
	"time"

	"github.com/ddo/go-fast"
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

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
}

func checkError(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan []int) (FastDotCom, error) {
	fastCom := fast.New()

	// initialize
	err := fastCom.Init()
	checkError(err)

	// get urls, typically 3 in number
	urls, err := fastCom.GetUrls()
	checkError(err)

	// measure in bits per second
	KbpsChan := make(chan float64)

	go func() {
		for Kbps := range KbpsChan {
			fmt.Printf("%.2f Kbps %.2f Mbps\n", Kbps, Kbps/1000)
		}
	}()

	err = fastCom.Measure(urls, KbpsChan)
	checkError(err)
	return FastDotCom{}, nil
}

func main() {
	start := time.Now()
	// runtime.GOMAXPROCS(4)
	fastCom := FastDotCom{}
	dataChannel := make(chan []int)
	fastCom.RunSpeedTest(dataChannel)

	fmt.Println(time.Since(start))
}
