require('./config/mongo');

const { faker } = require('@faker-js/faker');
const User = require('./models/user');
const Profile = require('./models/profile');
const Post = require('./models/post');
const Comment = require('./models/comment');
const Like = require('./models/like');
const Follow = require('./models/follow');
const Media = require('./models/media');

async function seedDatabase() {
  const users = [];
  const profiles = [];
  const posts = [];
  const comments = [];
  const likes = new Set();
  const follows = new Set();
  const media = [];

  const emails = new Set();

  const generateUniqueEmail = () => {
    let email;
    do {
      email = faker.internet.email();
    } while (emails.has(email));
    emails.add(email);
    return email;
  };

  for (let i = 0; i < 20; i++) {
    const user = new User({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
      email: generateUniqueEmail(),
      profilePicture: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      dateJoined: faker.date.past(),
    });
    await user.save();
    users.push(user);

    const profile = new Profile({
      user: user._id,
      birthday: faker.date.past(),
      interests: faker.lorem.words(3).split(' '),
      hobby: faker.lorem.words(3).split(' '),
    });
    await profile.save();
    profiles.push(profile);

    const post = new Post({
      content: faker.lorem.paragraph(),
      author: user._id,
      likesCount: faker.number.int(100),
      comments: [],
    });
    await post.save();
    posts.push(post);

    const mediaEntry = new Media({
      url: faker.image.url(),
      type: faker.helpers.arrayElement(['image', 'video']),
      post: post._id,
    });
    await mediaEntry.save();
    media.push(mediaEntry);

    post.media.push(mediaEntry._id);
    await post.save();
  }

  for (let i = 0; i < 50; i++) {
    const comment = new Comment({
      content: faker.lorem.sentences(),
      author: faker.helpers.arrayElement(users)._id,
      post: faker.helpers.arrayElement(posts)._id,
    });
    await comment.save();
    comments.push(comment);
  }

  while (likes.size < 50) {
    const user = faker.helpers.arrayElement(users)._id;
    const post = faker.helpers.arrayElement(posts)._id;
    const likeKey = `${user}_${post}`;
    if (!likes.has(likeKey)) {
      const like = new Like({ user, post });
      await like.save();
      likes.add(likeKey);
    }
  }

  while (follows.size < 50) {
    const follower = faker.helpers.arrayElement(users)._id;
    const followed = faker.helpers.arrayElement(users)._id;
    const followKey = `${follower}_${followed}`;
    if (follower !== followed && !follows.has(followKey)) {
      const follow = new Follow({ follower, followed });
      await follow.save();
      follows.add(followKey);
    }
  }
}

seedDatabase()
  .then(() => console.log('Populating DB finished successfully'))
  .catch((error) => console.error(error));
