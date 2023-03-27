const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'hi',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-888',
      content: useCasePayload.content,
      owner: 'user-888',
    });

    const mockThreadId = 'thread-888';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(new AddedComment({
      id: 'comment-888',
      content: useCasePayload.content,
      owner: 'user-888',
    })));
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedComment = await addCommentUseCase
      .execute(useCasePayload, mockAddedComment.owner, mockThreadId);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment({
      content: 'hi',
    }, mockThreadId, mockAddedComment.owner));
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(mockThreadId);
  });
});
