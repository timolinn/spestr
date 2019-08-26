package fastdotcom

import (
	"fmt"
	"time"

	log "github.com/sirupsen/logrus"
	"github.com/timolinn/go-fast"
)

const baseURL = "https://api.fast.com/"

// NetworkStatus represents the summary
// of the tested network
// only Download speed is supported at the moment
type NetworkStatus struct {
	Upload   int
	Download int `json:"download"`
	Latency  struct {
		Loaded   int
		Unloaded int
	}
}

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
	Done    bool
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan int) (FastDotCom, error) {
	fastCom := fast.New()

	// initialize
	err := fastCom.Init()
	if err != nil {
		log.Errorf("Failed to initialize fastdotcom")
		return fdcm, err
	}

	// get urls, typically 3 in number
	urls, err := fastCom.GetUrls()
	if err != nil {
		log.Errorf("Failed to get urls")
		return fdcm, err
	}

	// measure in bits per second
	KbpsChan := make(chan float64)
	var Mbps int
	go func() {
		for Kbps := range KbpsChan {
			// fmt.Printf("%.2f Kbps %.2f Mbps\n", Kbps, Kbps/1000)
			// fmt.Println(KbpsChan)
			// Mbps = int(Kbps / 1000)
			dataChannel <- int(Kbps)
		}
	}()

	// TODO: Proper error reporting
	//TODO return errors with context message for higher abstraction
	err = fastCom.Measure(urls, KbpsChan)
	if err != nil {
		log.Errorf("Speed measurement failed: %v", err.Error())
		return fdcm, err
	}

	fdcm.Network.Download = Mbps
	dataChannel <- -1 // Done
	time.Sleep(1 * time.Second)
	close(dataChannel)
	fmt.Println("Data channel closed")
	return fdcm, nil
}
