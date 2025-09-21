import { model, Schema } from 'mongoose';

export const ProfileSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        image: {
            type: String,
            default: '',
        },
        cover_image: {
            type: String,
            default: '',
        },
        user_name: { type: String, required: false },
        dob: { type: String, default: '' },
        gender: { type: String, default: '' },
        title: { type: String, default: '' },
        headline: { type: String, default: '' },
        description: { type: String, default: '' },
        country: {
            type: Object,
            default: null,
        },
        city: {
            type: Object,
            default: null,
        },
        state: {
            type: Object,
            default: null,
        },
        timezone: { type: Object, default: null },
        contact_details: {
            website: { type: String, default: '' },
            number: { type: String, default: '' },
            country_code: { type: String, maxlength: 5, default: '' },
        },
        languages: [
            {
                flag: { type: String, default: '' },
                language: { type: String, default: '' },
                type: { type: String, default: '' },
            },
        ],
        skills: [{ name: { type: String, default: '' } }],
        verfication_status: { type: String, default: '' },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    },
);



const Profile = model("Profile", ProfileSchema);

Profile.watch().on("change", async (change) => {
    if (change.operationType === "delete") {
        try {
            const profileId = change.documentKey._id;

            const modelsToDelete = [
                { model: "Experience", filter: { profile_id: profileId } },
                { model: "Education", filter: { profile_id: profileId } },
                { model: "Achievements", filter: { profile_id: profileId } },
                { model: "Freelancer_Service", filter: { user_id: profileId } },
                { model: "Visibility", filter: { module_id: profileId } },
                { model: "TimeSlot", filter: { user_id: profileId } },
            ];

            for (const { model: modelName, filter } of modelsToDelete) {
                const Model = model(modelName);
                await Model.deleteMany(filter);
            }
        } catch (error) {
            console.log("Error in post delete change stream", error);
        }
    }
});

export default model('Profile', ProfileSchema);

