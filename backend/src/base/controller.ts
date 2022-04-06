import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import Events from 'events';

/**
 * Exports decorator function to set type of model
 */
export function Route(method: string = 'GET', path: string, acl: Array<string> = [], priority: number = 100) {
  // return function
  return (target: any, propertyKey: string) => {
    // Add namespace and subspace
    Reflect.defineMetadata('route:acl', acl, target, propertyKey);
    Reflect.defineMetadata('route:path', path, target, propertyKey);
    Reflect.defineMetadata('route:method', method, target, propertyKey);
    Reflect.defineMetadata('route:priority', priority, target, propertyKey);
  };
}

/**
 * Create Controller class
 */
export default class NFTController extends Events {
  // variables
  public routes: Array<any>;
  public building: Promise<any>;
  
  /**
   * construct controller class
   */
  constructor(base) {
    // run super
    super();

    // super
    this.base = base;

    // building
    this.building = this.build();
  }

  /**
   * Builds the current controller
   */
  public async build(): Promise<void> {
    // build routes
    this.routes = Reflect.ownKeys(Object.getPrototypeOf(this))
      .filter((property) => typeof this[property] === 'function')
      .filter((property) => Reflect.hasMetadata('route:path', this, property))
      .map((property) => ({
        ctrl : this,
        property,

        acl      : Reflect.getMetadata('route:acl', this, property),
        path     : Reflect.getMetadata('route:path', this, property),
        method   : Reflect.getMetadata('route:method', this, property),
        priority : Reflect.getMetadata('route:priority', this, property)
      }));
    
    // bind routes
    this.routes.forEach(({ property }) => {
      // bind property
      this[property] = this[property].bind(this);
    });
  }
}