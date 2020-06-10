import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  constructor(public translate: TranslateService) {
    translate.addLangs(['fr', 'en']);
    translate.setDefaultLang('fr');
    translate.use('fr');
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
}
