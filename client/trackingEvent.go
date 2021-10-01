package main

import "fmt"

type TrackingEvent struct {
	Id         int    `json:"id"`
	ParcelId   int    `json:"parcelId"`
	ExternalId string `json:"externalId"`
	Location   string `json:"location"`
	Message    string `json:"message"`
	Type       string `json:"type"`
}

func PrintTrackingEvents(ts []TrackingEvent) string {
	s := ""
	for i := 0; i < len(ts); i++ {
		s += ts[i].Text()
	}
	return s
}

func (t TrackingEvent) Text() string {
	s := fmt.Sprintf(
		"Type: %s\n ExternalId: %s\nLocation: %s\nMessage: [%s]\n\n",
		t.Type, t.ExternalId, t.Location, t.Message)
	return s
}
