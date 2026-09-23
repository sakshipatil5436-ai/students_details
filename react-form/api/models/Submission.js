import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
});

const SubmissionSchema = new mongoose.Schema({
  projectTopic: { type: String, required: true, unique: true },
  students: [StudentSchema],
  submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

export default Submission;
