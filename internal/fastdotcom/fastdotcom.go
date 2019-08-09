package fastdotcom

import (
	"log"

	"github.com/ddo/go-fast"
)

const baseURL = "https://api.fast.com/"

// NetworkStatus represents the summary
// of the tested network
type NetworkStatus struct {
	Upload   int64
	Download int64
	Latency  struct {
		Loaded   int64
		Unloaded int64
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
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan int64) (FastDotCom, error) {
	fastCom := fast.New()

	// initialize
	err := fastCom.Init()
	checkError(err)

	// get urls, typically 3 in number
	urls, err := fastCom.GetUrls()
	checkError(err)

	// measure in bits per second
	KbpsChan := make(chan float64)
	var Mbps int64
	go func() {
		for Kbps := range KbpsChan {
			// fmt.Printf("%.2f Kbps %.2f Mbps\n", Kbps, Kbps/1000)
			Mbps = int64(Kbps / 1000)
			// dataChannel <- Mbps
		}
	}()

	err = fastCom.Measure(urls, KbpsChan)
	checkError(err)
	fdcm.Network.Download = Mbps
	return fdcm, nil
}

// func main() {
// 	start := time.Now()
// 	// runtime.GOMAXPROCS(4)
// 	fastCom := FastDotCom{}
// 	dataChannel := make(chan int64)
// 	fastCom, err := fastCom.RunSpeedTest(dataChannel)
// 	checkError(err)

// 	fmt.Printf("Your internet download speed in bits per second is %d Mbps\n ", fastCom.Network.Download)
// 	fmt.Println(time.Since(start))
// }
