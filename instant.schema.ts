import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    events: i.entity({
      title: i.string().optional(),
      eventName: i.string().optional(),
      description: i.string().optional(),
      startDateTime: i.string().optional(),
      postCode: i.string().optional(),
      address: i.string().optional(),
      venueName: i.string().optional(),
      costType: i.string().optional(),
      cost: i.string().optional(),
      accessibility: i.string().optional(),
      bookingUrl: i.string().optional(),
      primaryCategory: i.string().optional(),
      tags: i.string().optional(),
      eventType: i.string().optional(),
      priceBand: i.string().optional(),
      musicType: i.string().optional(),
      creativeType: i.string().optional(),
      learningType: i.string().optional(),
      socialLevel: i.string().optional(),
      eventFormat: i.string().optional(),
      meetingPeople: i.string().optional(),
      eventTime: i.string().optional(),
      durationBand: i.string().optional(),
      transport: i.string().optional(),
      stepFree: i.string().optional(),
      noise: i.string().optional(),
      seating: i.string().optional(),
      primaryBenefit: i.string().optional(),
      eventMood: i.string().optional(),
      lat: i.number().optional(),
      lng: i.number().optional(),
    }),
    questionnaire_responses: i.entity({
      questionId: i.string(),
      selectedOptionIds: i.json(),
      lat: i.number().optional(),
      lng: i.number().optional(),
      userId: i.string().optional(),
      createdAt: i.number(),
    }),
  },
});

type AppSchema = typeof _schema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
