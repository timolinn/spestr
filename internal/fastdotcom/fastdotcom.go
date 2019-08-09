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
func (fdcm FastDotCom) RunSpeedTest(dataChannel chan []int) (FastDotCom, error) {
	servers, _ := getServers()
	result := make([]int, 3)
	for idx, server := range servers {
		go getRandomData(server.URL, dataChannel, result, idx)
	}
	time.Sleep(1 * time.Second)
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

func getRandomData(url string, dataChannel chan []int, result []int, index int) {
	// p := new(bytes.Buffer)
	// data, err := http.NewRequest("GET", url, p)
	data, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer data.Body.Close()
	// expecting upto 25mb of data
	buf := make([]byte, 100*1024)
	// s := strings.Split(strings.Split(url, ".")[4], "=")
	idx := 0

	for {
		idx++
		// fmt.Println(s[len(s)-1])
		_, err := data.Body.Read(buf)
		if err != nil {
			break
		}
		// fmt.Printf("Before: %d\n", result)
		result[index] = len(buf) * idx
		// fmt.Printf("After: %d\n", result)
		dataChannel <- result
		// this helps ensure the first goroutine
		// does not domionate returned bytes
		time.Sleep(100 * time.Millisecond)
	}

	// fmt.Println("passing data for " + url + " through the channel")
	// return []byte{}
}

func findIpv4Addr(fqdn string) {

}

func findIpv6Addr(fqdn string) {

}

func applicationBytesToNetworkBits(kbps int) float64 {
	return (float64(kbps) * float64(8) * float64(1.0415))
}

func main() {
	start := time.Now()
	// runtime.GOMAXPROCS(4)
	fastCom := FastDotCom{}
	dataChannel := make(chan []int)
	go fastCom.RunSpeedTest(dataChannel)
	// if err != nil {
	// 	panic(err)
	// }
	maxtime := 15
	sleepseconds := 3
	highestspeedkBps := 0
	// maxdownload := 60 //MB
	nrloops := maxtime / sleepseconds
	// count := 0
	lastTotalBytes := 0
	// go func() {
	var result []int
	go func() {
		for data := range dataChannel {
			result = data
			// fmt.Println(data)
		}
	}()

	for i := 0; i < nrloops; i++ {
		totalBytes := 0
		for _, data := range result {
			totalBytes += data
		}
		delta := totalBytes - lastTotalBytes
		fmt.Printf("delta = %d\n", delta)
		speedkBps := (delta / sleepseconds) / (1024)
		fmt.Printf("speedkBps = %d\n", speedkBps)
		lastTotalBytes = totalBytes
		if speedkBps > highestspeedkBps {
			highestspeedkBps = speedkBps
		}
		// fmt.Printf("highestspeedkBps = %d\n", highestspeedkBps)
		time.Sleep(time.Duration(sleepseconds) * time.Second)
		// for num := range []int{1, 2, 3} {
		// 	fmt.Println(num)
		// }

		// if count > nrloops*12 {
		// 	close(dataChannel)
		// }
	}
	// }()
	// fmt.Scanln()
	Mbps := (applicationBytesToNetworkBits(highestspeedkBps) / 1024)
	fmt.Println(Mbps)
	close(dataChannel)
	fmt.Println("Done")
	fmt.Println(time.Since(start))
}

// func main() {
// 	start := time.Now()
// 	// runtime.GOMAXPROCS(4)
// 	fastCom := FastDotCom{}
// 	dataChannel := make(chan int)
// 	_, err := fastCom.RunSpeedTest(dataChannel)
// 	if err != nil {
// 		panic(err)
// 	}
// 	maxtime := 10
// 	sleepseconds := 3
// 	highestspeedkBps := 0
// 	// maxdownload := 60 //MB
// 	nrloops := maxtime / sleepseconds
// 	count := 0
// 	lastTotalBytes := 0
// 	totalBytes := 0
// 	go func() {

// 		for data := range dataChannel {
// 			count++
// 			totalBytes += data
// 			fmt.Println(totalBytes)
// 			delta := totalBytes - lastTotalBytes
// 			speedkBps := (delta / sleepseconds) / (1024)
// 			lastTotalBytes = totalBytes
// 			if speedkBps > highestspeedkBps {
// 				highestspeedkBps = speedkBps
// 			}

// 		}
// 	}()
// 	time.Sleep(time.Duration(nrloops*3) * time.Second)
// 	close(dataChannel)
// 	Mbps := (applicationBytesToNetworkBits(highestspeedkBps) / 1024)
// 	fmt.Println(Mbps)
// 	fmt.Println("Done")
// 	fmt.Println(time.Since(start))
// }
