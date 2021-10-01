package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Starting client")
	parcels, err := requestParcels()
	if err != nil {
		fmt.Printf("Could not fetch parcels (%s)\n", err.Error())
		return
	}

	fmt.Printf("parcels size %d\n", len(parcels))

	for i := 0; i < len(parcels); i++ {
		parcel := parcels[i]
		fmt.Printf("parcels[%d]=%s, events=%d\n", i, parcel.TrackingId, len(parcel.Events))

		hasNewEvent, err := parcel.HasNewEvent()
		if err != nil {
			fmt.Printf("[%s] Could not determine new event (%s)\n", parcel.TrackingId, err.Error())
			return
		}

		if hasNewEvent {
			newestEvent := parcel.Events[len(parcel.Events)-1]
			if err := parcel.WriteNewEvent(newestEvent); err != nil {
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

func requestParcels() ([]Parcel, error) {
	resp, err := http.Get("http://localhost:3000/v0/parcel")
	if err != nil {
		fmt.Printf("Request failed - %s\n", err.Error())
	}
	defer resp.Body.Close()
	fmt.Printf("%s %d - %s\n", resp.Request.Method, resp.StatusCode, resp.Request.URL)

	var pResp []Parcel

	if err := json.NewDecoder(resp.Body).Decode(&pResp); err != nil {
		fmt.Printf("Could not unmarshal JSON - %s", err.Error())
	}

	return pResp, nil
}
