const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadUseCase {
  constructor({
    replyRepository,
    threadRepository,
    commentRepository,
    userRepository,
  }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    // get thread
    const thread = await this._threadRepository.getThreadById(threadId);

    // get comments
    const commentsInThread = await this._getAllComments(threadId);

    // get replies
    const commentsWithReplies = await this._getAllReplies(commentsInThread);

    const threadDetail = new ThreadDetail({ ...thread, comments: commentsWithReplies });
    return threadDetail;
  }

  async _getAllComments(threadId) {
    let comments = await this._commentRepository.getCommentsInThread(threadId);
    comments = comments.map((comment) => new GetComment(comment));

    return comments;
  }

  async _getAllReplies(comments) {
    const commentIds = comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getRepliesOfComments(commentIds);

    const commentsWithReplies = comments.map((comment) => {
      const commentReplies = replies.filter((reply) => comment.id === reply.comment_id);
      return {
        ...comment,
        replies: commentReplies.map((reply) => new GetReply(reply)),
      };
    });

    return commentsWithReplies;
  }
}

module.exports = GetThreadUseCase;
