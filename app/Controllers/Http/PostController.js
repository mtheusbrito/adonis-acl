"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with posts
 */
const Post = use("App/Models/Post");

class PostController {
  /**
   * Show a list of all posts.
   * GET posts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, auth }) {
    const user = await auth.getUser();

    if (await user.can("read_private_posts")) {
      const posts = await Post.all();
      return posts;
    }
    const posts = await Post.query()
      .where({ type: "public" })
      .fecth();
    return posts;
  }

  async store({ request, auth }) {
    const data = request.only(["title", "content", "type"]);
    const post = await Post.create({ ...data, user_id: auth.user.id });
    return post;
  }
  async show({ params, auth, response }) {
    const post = await Post.findOrFail(params.id);

    if (post.type === "public") {
      return post;
    }

    const user = await auth.getUser();
    if (await user.can("read_private_posts")) {
      return post;
    }
    return response.status(400).send({
      error: {
        message: "Você não tem permissao de leitura!"
      }
    });
  }
}

module.exports = PostController;
