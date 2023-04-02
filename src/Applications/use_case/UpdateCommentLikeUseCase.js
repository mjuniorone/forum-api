class UpdateCommentLikeUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const checkResult = await this._commentRepository.checkCommentLike(commentId, userId);

    if (!checkResult) {
      await this._commentRepository.likeComment(commentId, userId);
    } else {
      await this._commentRepository.unlikeComment(commentId, userId);
    }
  }
}

module.exports = UpdateCommentLikeUseCase;
