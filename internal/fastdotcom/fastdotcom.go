package fastdotcom

import (
	"fmt"
	"time"

	"github.com/ddo/go-fast"
	"github.com/timolinn/spestr/internal/util"
)

const baseURL = "https://api.fast.com/"

// NetworkStatus represents the summary
// of the tested network
// only Download speed is supported at the moment
type NetworkStatus struct {
	Upload   int
	Download int
	Latency  struct {
		Loaded   int
		Unloaded int
	}
}

// FastDotCom represents all the data
// returned from fast.com
type FastDotCom struct {
	Network NetworkStatus
}

// RunSpeedTest interacts with fast.com to fetch
// the Network status data and metadata
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan int) (FastDotCom, error) {
	fastCom := fast.New()

	// initialize
	err := fastCom.Init()
	util.CheckError(err, "failed to initialize fastCom")

	// get urls, typically 3 in number
	urls, err := fastCom.GetUrls()
	util.CheckError(err, "failed to get Urls")

	// measure in bits per second
	KbpsChan := make(chan float64)
	var Mbps int
	go func() {
		for Kbps := range KbpsChan {
			fmt.Printf("%.2f Kbps %.2f Mbps\n", Kbps, Kbps/1000)
			Mbps = int(Kbps / 1000)
			dataChannel <- Mbps
		}
	}()

	err = fastCom.Measure(urls, KbpsChan)
	util.CheckError(err, "Speed measurement failed")
	fdcm.Network.Download = Mbps
	time.Sleep(1 * time.Second)
	close(dataChannel)
	return fdcm, nil
}

// func main() {
// 	start := time.Now()
// 	// runtime.GOMAXPROCS(4)
// 	fastCom := FastDotCom{}
// 	dataChannel := make(chan int64)
// 	fastCom, err := fastCom.RunSpeedTest(dataChannel)
// 	util.CheckError(err, "Speed test failed")

// 	fmt.Printf("Your internet download speed in bits per second is %d Mbps\n ", fastCom.Network.Download)
// 	fmt.Println(time.Since(start))
// }
