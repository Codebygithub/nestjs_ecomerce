export class FilterCommentDto {
    commentId :string
    productId:string
    limit?:number = 50
    offset?:number = 0;
    parentCommentId:string
}