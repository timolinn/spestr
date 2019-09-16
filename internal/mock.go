package internal

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
)

// mockServerForQuery returns a mock server that only responds to a particular query string.
// func mockServerForQuery(query string, code int, body string) *countingServer {
// 	server := &countingServer{}

// 	server.s = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		if query != "" && r.URL.RawQuery != query {
// 			dmp := diffmatchpatch.New()
// 			diffs := dmp.DiffMain(query, r.URL.RawQuery, false)
// 			log.Printf("Query != Expected Query: %s", dmp.DiffPrettyText(diffs))
// 			server.failed = append(server.failed, r.URL.RawQuery)
// 			http.Error(w, "fail", 999)
// 			return
// 		}
// 		server.successful++

// 		w.WriteHeader(code)
// 		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
// 		fmt.Fprintln(w, body)
// 	}))

// 	return server
// }

// Create a mock HTTP Server that will return a response with HTTP code and body.
func MockServer(code int, body string) *httptest.Server {
	serv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(code)
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		fmt.Fprintln(w, body)
	}))
	return serv
}

func TestingHTTPClient(handler http.Handler) (*http.Client, func()) {
	s := httptest.NewTLSServer(handler)

	cli := &http.Client{
		Transport: &http.Transport{
			DialContext: func(_ context.Context, network, _ string) (net.Conn, error) {
				return net.Dial(network, s.Listener.Addr().String())
			},
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}

	return cli, s.Close
}
