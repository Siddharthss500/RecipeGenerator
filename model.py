import gpt_2_simple as gpt2

def extend(data):
    # Load the pretrained model
    sess = gpt2.start_tf_sess()
    gpt2.load_gpt2(sess, run_name='run1', checkpoint_dir="C:\\Users\\siddh\\checkpoint")

    # Getting input data
    input_data = "---------Ingredients---------\n"+data+"\n---------End of Ingredients---------\n---------Recipe---------"

    # To generate the recipes
    single_text = gpt2.generate(sess,
                                run_name="run1",
                                checkpoint_dir="C:\\Users\\siddh\\checkpoint",
                                length=250,
                                temperature=0.7,
                                prefix=input_data,
                                truncate="---------End of Recipe---------",
                                nsamples=2,
                                batch_size=2,
                                include_prefix=False,
                                return_as_list=True
                                )[0]
    return single_text

