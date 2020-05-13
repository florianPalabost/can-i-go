import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import { faSearchLocation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  faSearchLocation = faSearchLocation;
  addressForm: FormGroup;
  showDropDown = false;
  addresses: any = [];
  addressSelected: [];
  addressSelectedCoord: [string, string];

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
  langs = ['en', 'fr'];

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private translate: TranslateService) {
    const browserlang = this.translate.getBrowserLang();
    if (this.langs.indexOf(browserlang) > -1) {
      this.translate.setDefaultLang(browserlang);
    } else {
      this.translate.setDefaultLang('en');
    }

  }

  ngOnInit(): void {
    this.addressForm = this.formBuilder.group({
      address: ['', Validators.required],
    });
  }

  async retrieveRequestAddress(q) {
    if (q.length > 3) {

      await this.http.get('https://api-adresse.data.gouv.fr/search/?q=' + q).subscribe((data: any) => {

      this.addresses = data.features;
      this.addresses.forEach(add => {
        add.label = add.properties.label;
      });
      this.showDropDown = !this.showDropDown;
      });

    }
  }

  hideDropDown = (event) => {
    this.showDropDown = false;
  }

  handleSelectedAdress = (addressObj) => {
    const coordinates = addressObj.geometry.coordinates;
    this.addressSelectedCoord = coordinates;
  }

  getUserLocation() {
    console.log('user location');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.addressSelectedCoord = [longitude.toString(), latitude.toString()];
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}
