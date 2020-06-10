import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as leaflet from 'leaflet';
import * as geometry from 'leaflet-geometryutil';
import * as turf from '@turf/turf';
import {HttpClient} from '@angular/common/http';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges {

  config = {
    displayKey: 'label',
    search: true,
    height: 'auto',
    placeholder: 'Select' ,
    moreText: 'more' ,
    noResultsFound: 'No results found!',
    searchPlaceholder: 'Search',
    searchOnKey: 'properties.label',
    clearOnSelection: false ,
    inputDirection: 'ltr'
  };
  map;
  showDropDown = false;
  smallIcon = this.createMarker('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png');
  smallIconNewLocation = this.createMarker('https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png');

  @Input() address: Array<any>;

  addressesNewLocation: [];
  addressNewLocationSelected: [];

  constructor(private http: HttpClient, private alertService: AlertService) { }

  ngAfterViewInit(): void {
    this.createMap();
  }

  createMap() {
    const loc = {
      lat: this.address[1],
      lng: this.address[0],
    };

    const zoom = 7;
    this.map = leaflet.map('map', {
      center: [loc.lat, loc.lng],
      zoom
    });

    const layer = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 6,
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    layer.addTo(this.map);
    if (this.address[0] && this.address[1]) {
      this.addMarker(loc);
      this.addCircle(loc);
      this.map.flyTo([this.address[1], this.address[0]], 8);
    }
  }

  createMarker(urlMarker = '') {
    return new leaflet.Icon({
      iconUrl: urlMarker,
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
      iconSize:    [25, 41],
      iconAnchor:  [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      shadowSize:  [41, 41]
    });
  }

  addMarker(coords) {
    const marker = leaflet.marker([coords.lat, coords.lng], {icon: this.smallIcon});
    marker.addTo(this.map);
  }

  addCircle(coords) {
    const marker = leaflet.circle([coords.lat, coords.lng], 100000 , {
      color: 'red',
      fillColor: '#f03',
    });
    marker.addTo(this.map);
  }

  async retrieveNewLocation(q) {
    if (q.length > 3) {
      await this.http.get('https://api-adresse.data.gouv.fr/search/?q=' + q).subscribe((data: any) => {
        this.addressesNewLocation = data.features;
        this.addressesNewLocation.forEach((add: any) => {
          add.label = add.properties.label;
        });
        this.showDropDown = !this.showDropDown;
      });

    }
  }

  handleSelectedAdress(addressObj) {
    const coordinates = addressObj.geometry.coordinates;
    this.addPointMarker(coordinates);
  }

  addPointMarker(coords) {
    const marker = leaflet.marker([coords[1], coords[0]], {icon: this.smallIconNewLocation});
    marker.addTo(this.map);

    // draw line between center & new marker
    const line = leaflet.polyline([[this.address[1], this.address[0]], [coords[1], coords[0]]], {
      color: 'green'
    });
    // calc distance between center of circle and the destination
    const distanceKM = Math.round(
      turf.distance( [Number(this.address[1]), Number(this.address[0])],  [Number(coords[1]), Number(coords[0])]));

    const distanceOiseau = Math.round(
        leaflet.latLng([this.address[1], this.address[0]]).distanceTo([coords[1], coords[0]]) / 1000);

    line.bindPopup(`Entre ces 2 points il y a ${distanceKM} km réel et ${distanceOiseau} km à voi d'oiseau`);
    line.addTo(this.map);

    this.alertService.clear();
    distanceOiseau <= 100 ?
        this.alertService.success('Vous pouvez vous déplacer vers ce lieu', true) :
          this.alertService.error('Vous ne pouvez PAS vous déplacer vers ce lieu !');

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.address = changes.address.currentValue;
    if (this.map !== undefined){
      this.map.off();
      this.map = this.map.remove();
      this.createMap();
    }

  }
}
