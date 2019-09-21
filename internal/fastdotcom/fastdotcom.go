package fastdotcom

import (
	"fmt"
	"time"

	"github.com/timolinn/spestr/internal/util"

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
	IspInfo util.IPData `json:"ispInfo"`
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan int) (FastDotCom, error) {
	defer close(dataChannel)
	fastCom := fast.New()

	// initialize
	err := fastCom.Init()
	if err != nil {
		log.Errorf("Failed to initialize fastdotcom")
		dataChannel <- util.ERROR_FAILED_TO_INITIALIZE_FATSDOTCOM
		return fdcm, err
	}

	// get urls, typically 3 in number
	urls, err := fastCom.GetUrls()
	if err != nil {
		log.Errorf("Failed to get urls")
		dataChannel <- util.ERROR_FAILED_TO_GET_URL
		return fdcm, err
	}

	// measure in bits per second
	KbpsChan := make(chan float64)
	var Mbps int
	go func() {
		for Kbps := range KbpsChan {
			// fmt.Printf("%.2f Kbps %.2f Mbps\n", Kbps, Kbps/1000)
			// fmt.Println(KbpsChan)
			Mbps = int(Kbps)
			dataChannel <- int(Kbps)
		}
	}()

	// TODO: Proper error reporting
	//TODO return errors with context message for higher abstraction
	err = fastCom.Measure(urls, KbpsChan)
	if err != nil {
		log.Errorf("Speed measurement failed: %v", err.Error())
		dataChannel <- util.ERROR_SPEED_TEST_FAILED
		return fdcm, err
	}

	fdcm.Network.Download = Mbps
	dataChannel <- util.OK_SPEED_TEST_COMPLETE // Done
	time.Sleep(1 * time.Second)
	fmt.Println("Data channel closed")
	return fdcm, nil
}
