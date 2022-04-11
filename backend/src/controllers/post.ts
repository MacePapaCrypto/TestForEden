
// import nft controller
import ethUtil from 'ethereumjs-util';
import { generateNonce, SiweMessage } from 'siwe';

// import local
import NFTController, { Route } from '../base/controller';
import PostModel from '../models/post';

/**
 * create auth controller
 */
export default class AuthController extends NFTController {

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/post')
  async listAction(req, { data, params }, next) {

    // return
    return {
      result  : [],
      success : true,
    }
  }

  /**
   * post create endpoint
   *
   * @returns 
   */
  @Route('POST', '/post')
  async createAction(req, { data, params }, next) {
    // get message/signature

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post delete endpoint
   *
   * @returns 
   */
  @Route('DELETE', '/post/:id')
  async deleteAction(req, { data, params }, next) {
    // get message/signature
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post toggle reaction endpoint
   *
   * @returns 
   */
  @Route('POST', '/post/:id/react')
  async reactAction(req, { data, params }, next) {
    // get message/signature
    const { emoji } = data;
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post react endpoint
   *
   * @returns 
   */
  @Route('POST', '/post/:id/reply')
  async replyAction(req, { data, params }, next) {
    // get message/signature
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post react endpoint
   *
   * @returns 
   */
  @Route('DELETE', '/post/:id/reply/:reply')
  async deleteReplyAction(req, { data, params }, next) {
    // get message/signature
    const { id, reply } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }
}