
import Model, { Type } from '../base/model';
import UserModel from './user';

/**
 * export model
 */
@Type('token')
export default class TokenModel extends Model {

  /**
   * gets user
   */
  getUser() {
    // return user
    return UserModel.findById(this.get('account'));
  }
  
  /**
   * find by package
   *
   * @param name 
   * @returns 
   */
  static async findByToken(token) {
    // find by package
    return (await TokenModel.findByRef(`token:${token.toLowerCase()}`, 1))[0];
  }
}