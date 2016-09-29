import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppRootComponent } from './app-root.component';
import { AppModule } from '../src/app.module';


@NgModule({
  imports: [
    BrowserModule,
    AppModule
  ],
  declarations: [
    AppRootComponent
  ],
  bootstrap: [
    AppRootComponent
  ]
})
export class AppRootModule {}
