exports.up = (pgm) => {
  pgm.addConstraint('comment_likes', 'fk_comment_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('comment_likes', 'fk_comment_likes.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.user_id_users.id');
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.comment_id_comments.id');
};
