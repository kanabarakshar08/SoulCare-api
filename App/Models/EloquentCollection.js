import { model } from 'mongoose';
import { UserSchema } from './User.js';
import { featureSchema } from './Feature.js';
import { therapySchema } from './Therapy.js';
import { blogSchema } from './Blog.js';
import { videoSchema } from './Video.js';
import { appointmentSchema } from './Appointment.js';
import { chatBotSchema } from './ChatBot.js';
import { ProfileSchema } from './Profile.js';

export default () => {
    model('users', UserSchema);
    model('features', featureSchema);
    model('therapies', therapySchema);
    model('blogs', blogSchema);
    model('videos', videoSchema);
    model('appointments', appointmentSchema);
    model('chatbots', chatBotSchema);
    model('Profiles', ProfileSchema);
}
