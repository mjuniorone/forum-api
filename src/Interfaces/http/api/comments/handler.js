const autoBind = require('auto-bind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const UpdateCommentLikeUseCase = require('../../../../Applications/use_case/UpdateCommentLikeUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const { id } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(request.payload, id, threadId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async putCommentLikeHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const updateCommentLikeUseCase = this._container.getInstance(UpdateCommentLikeUseCase.name);
    await updateCommentLikeUseCase.execute(userId, threadId, commentId);

    return {
      status: 'success',
    };
  }

  async deleteCommentHandler(request) {
    const { id } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(threadId, commentId, id);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
