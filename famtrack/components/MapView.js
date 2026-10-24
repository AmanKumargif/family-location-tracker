"use client";
import { useEffect, useRef, useState } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";
export default function MapView({ points, focus }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY });
  const map = useRef(null), [open, setOpen] = useState(null);
  useEffect(() => {
    if (!map.current || !window.google || !points.length) return;
    if (points.length === 1) { map.current.setCenter({ lat: points[0].lat, lng: points[0].lng }); map.current.setZoom(15); return; }
    const b = new window.google.maps.LatLngBounds(); points.forEach((p) => b.extend({ lat: p.lat, lng: p.lng })); map.current.fitBounds(b, 60);
  }, [points.length, isLoaded]);
  useEffect(() => { if (focus && map.current) { map.current.panTo({ lat: focus.lat, lng: focus.lng }); map.current.setZoom(16); setOpen(focus.id); } }, [focus]);
  if (loadError) return <div className="mapbox">Google Maps failed to load. Check your API key and that Maps JavaScript API is enabled.</div>;
  if (!isLoaded) return <div className="mapbox">Loading map…</div>;
  return (<div className="mapbox" style={{ padding: 0 }}><GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={{ lat: 20.59, lng: 78.96 }} zoom={4} onLoad={(m) => (map.current = m)} options={{ streetViewControl: false, mapTypeControl: false }}>
    {points.map((p) => (<MarkerF key={p.id} position={{ lat: p.lat, lng: p.lng }} label={{ text: p.name[0].toUpperCase(), fontWeight: "700" }} onClick={() => setOpen(p.id)}>
      {open === p.id && <InfoWindowF onCloseClick={() => setOpen(null)}><div><b>{p.name}</b><br />Updated {p.ago}<br />Accuracy ±{Math.round(p.accuracy || 0)} m</div></InfoWindowF>}</MarkerF>))}
  </GoogleMap></div>);
}
