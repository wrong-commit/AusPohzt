package main

import (
	"fmt"
)

type Parcel struct {
	Id         int             `json:"id"`
	TrackingId string          `json:"trackingId"`
	Owner      int             `json:"owner"`
	NickName   string          `json:"nickName"`
	Events     []TrackingEvent `json:"events"`
}

type ParcelsResponse []Parcel

func (p Parcel) Text() string {
	s := fmt.Sprintf(
		"ParcelId: %s\nOwner: %d\nTrackingEvents: [%s]\n",
		p.TrackingId, p.Owner, PrintTrackingEvents(p.Events))
	return s
}
