import Chance from "chance";

const c = new Chance();

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export class Coordinates implements ICoordinates {
  constructor(
    public latitude: number = c.latitude(),
    public longitude: number = c.longitude()
  ) {}
}

export interface ILocation {
  coordinates: ICoordinates;
  country: string;
  city: string;
  address: string;
}

export class Location implements ILocation {
  constructor(
    public coordinates: ICoordinates = new Coordinates(),
    public country: string = c.country(),
    public city: string = c.city(),
    public address: string = c.address()
  ) {}
}

export interface IPerson {
  name: string;
  age: number;
  title: string;
  location: ILocation;
}

export class Person implements IPerson {
  constructor(
    public name: string = c.name(),
    public age: number = c.age(),
    public title: string = c.profession(),
    public location: ILocation = new Location()
  ) {}
}
