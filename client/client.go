package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
)

func main() {

	p_printHelp := flag.Bool("h", false, "Display usage information")
	// location previous parcel event ids are cached, avoids duplicate notification alerts
	p_eventStorageLoc := flag.String("storageDir", "", "Storage location of parcel events")
	p_hostname := flag.String("hostname", "localhost", "AusPohzt API hostname")
	p_port := flag.Int("port", 3000, "AusPohzt API port")
	flag.Parse()

	// show help menu if -h flag passed
	if *p_printHelp {
		flag.PrintDefaults()
		return
	}

	// require -storageDir
	if *p_eventStorageLoc == "" {
		fmt.Println("Expected -storageDir=/path/to/dir arg")
		return
	}

	fmt.Println("Running client")
	parcels, err := requestParcels(*p_hostname, *p_port)
	if err != nil {
		fmt.Printf("Could not fetch parcels (%s)\n", err.Error())
		return
	}

	fmt.Printf("parcels size %d\n", len(parcels))

	for i := 0; i < len(parcels); i++ {
		parcel := parcels[i]
		fmt.Printf("parcels[%d]=%s, events=%d\n", i, parcel.TrackingId, len(parcel.Events))

		hasNewEvent, err := parcel.HasNewEvent(*p_eventStorageLoc)
		if err != nil {
			fmt.Printf("[%s] Could not determine new event (%s)\n", parcel.TrackingId, err.Error())
			return
		}

		if hasNewEvent {
			newestEvent := parcel.Events[len(parcel.Events)-1]
			if err := parcel.WriteNewEvent(newestEvent, *p_eventStorageLoc); err != nil {
				fmt.Printf("[%s] Could not write new event data (%s)\n", parcel.TrackingId, err.Error())
			} else {
				fmt.Printf("[+ %s] Wrote new tracking event data\n", parcel.TrackingId)
				// now alert user once event data written
				parcel.Notify(newestEvent)
			}
		}
	}
	return
}

func requestParcels(hostname string, port int) ([]Parcel, error) {
	resp, err := http.Get(fmt.Sprintf("http://%s:%d/v0/parcel", hostname, port))
	if err != nil {
		fmt.Printf("Request failed - %s\n", err.Error())
		return nil, err
	}
	defer resp.Body.Close()
	fmt.Printf("%s %d - %s\n", resp.Request.Method, resp.StatusCode, resp.Request.URL)

	var pResp []Parcel

	if err := json.NewDecoder(resp.Body).Decode(&pResp); err != nil {
		fmt.Printf("Could not unmarshal JSON - %s", err.Error())
		return nil, err
	}

	return pResp, nil
}
