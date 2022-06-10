import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import Events from 'events';

/**
 * Exports decorator function to set type of model
 */
export function Type(type: string) {
  // return function
  return (target: any) => {
    // Add namespace and subspace
    Reflect.defineMetadata('app:type', type, target);
  };
}

/**
 * Create Controller class
 */
export default class MoonApp extends Events {
  
  /**
   * construct controller class
   */
  constructor(base) {
    // run super
    super();

    // super
    this.base = base;
  }
  
}