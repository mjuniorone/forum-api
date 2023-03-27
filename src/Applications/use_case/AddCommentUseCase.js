const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    const newComment = new NewComment(useCasePayload, threadId, owner);
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
