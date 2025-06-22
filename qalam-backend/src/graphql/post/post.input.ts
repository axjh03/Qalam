import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  subtitle: string;

  @Field()
  contentStructure: string;

  @Field({ nullable: true })
  mediaUrl?: string;

  @Field({ nullable: true })
  mediaType?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  contentStructure?: string;

  @Field({ nullable: true })
  mediaUrl?: string;

  @Field({ nullable: true })
  mediaType?: string;
}

@InputType()
export class CreateCommentInput {
  @Field()
  content: string;
}

@InputType()
export class UpdateCommentInput {
  @Field()
  content: string;
} 